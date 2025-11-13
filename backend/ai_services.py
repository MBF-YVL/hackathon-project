"""
AI Services for CityPulse Montréal 2035
Integrates Groq and Gemini APIs for text generation
"""
import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Cache for cell summaries
_cell_summary_cache = {}
_scenario_narrative_cache = {}

def generate_cell_summary(cell_id: str, metrics: Dict[str, float], interventions: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate a short explanation for a cell using Groq
    
    Args:
        cell_id: Cell identifier
        metrics: Dictionary of stress metrics and CSI
        interventions: Dictionary of recommended interventions
    
    Returns:
        Dictionary with 'short' summary text and 'source'
    """
    # Check cache first
    if cell_id in _cell_summary_cache:
        return _cell_summary_cache[cell_id]
    
    try:
        import groq
        
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            return {
                'short': 'AI summary unavailable (API key not configured)',
                'source': 'fallback'
            }
        
        client = groq.Groq(api_key=api_key)
        
        # Prepare context
        top_stressors = []
        if metrics['traffic_stress'] > 0.6:
            top_stressors.append('high traffic')
        if metrics['air_stress'] > 0.6:
            top_stressors.append('air pollution')
        if metrics['heat_stress'] > 0.6:
            top_stressors.append('heat')
        if metrics['noise_stress'] > 0.6:
            top_stressors.append('noise')
        
        top_intervention = max(interventions.items(), key=lambda x: x[1].get('score', 0))
        
        prompt = f"""You are a city planning assistant in 2035 Montréal.
        
Cell has CSI of {metrics['csi_current']:.0f}/100. Main issues: {', '.join(top_stressors) if top_stressors else 'moderate stress'}.
Vulnerability factor: {metrics['vulnerability_factor']:.2f}.

Top intervention: {top_intervention[0]} (score {top_intervention[1]['score']:.2f}, expected CSI reduction: {abs(top_intervention[1]['expected_delta_csi'])}).

Provide a 2-3 sentence explanation of why this cell is stressed and how the intervention could help."""
        
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {"role": "system", "content": "You are a concise city planning assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        summary_text = response.choices[0].message.content.strip()
        
        result = {
            'short': summary_text,
            'source': 'groq'
        }
        
        # Cache it
        _cell_summary_cache[cell_id] = result
        
        return result
    
    except Exception as e:
        print(f"Error generating cell summary: {e}")
        return {
            'short': f"Cell stress level: {metrics['csi_current']:.0f}/100. Primary factors: traffic and environmental conditions. Recommended interventions could reduce stress significantly.",
            'source': 'fallback'
        }

def generate_scenario_narrative(car: float, transit: float, trees: float, metrics: Dict[str, float]) -> str:
    """
    Generate a rich narrative for a 2035 scenario using Gemini
    
    Args:
        car: Car dependence adjustment (-1.0 to 0.0)
        transit: Transit investment (0.0 to 1.0)
        trees: Tree investment (0.0 to 1.0)
        metrics: Aggregate metrics (current vs scenario CSI, hotspots, etc.)
    
    Returns:
        Narrative text
    """
    # Create cache key
    cache_key = f"{car}_{transit}_{trees}"
    if cache_key in _scenario_narrative_cache:
        return _scenario_narrative_cache[cache_key]
    
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
        if not api_key:
            return generate_fallback_narrative(car, transit, trees, metrics)
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""You are describing a 2035 urban planning scenario for Montréal.

Scenario parameters:
- Car dependence change: {car*100:.0f}% (reduction if negative)
- Transit investment: {transit*100:.0f}% increase
- Tree/greening investment: {trees*100:.0f}% increase

Results:
- Average CSI dropped from {metrics.get('avg_csi_current', 60):.0f} to {metrics.get('avg_csi_scenario', 45):.0f}
- Hotspots reduced from {metrics.get('hotspot_count_current', 20)} to {metrics.get('hotspot_count_scenario', 10)}

Write a compelling 3-4 sentence narrative about how this scenario transforms the experience of Montréalers in 2035. Focus on livability, equity, and climate resilience."""
        
        response = model.generate_content(prompt)
        narrative = response.text.strip()
        
        # Cache it
        _scenario_narrative_cache[cache_key] = narrative
        
        return narrative
    
    except Exception as e:
        print(f"Error generating scenario narrative: {e}")
        return generate_fallback_narrative(car, transit, trees, metrics)

def generate_fallback_narrative(car: float, transit: float, trees: float, metrics: Dict[str, float]) -> str:
    """Generate a simple fallback narrative when AI APIs are unavailable"""
    csi_drop = metrics.get('avg_csi_current', 60) - metrics.get('avg_csi_scenario', 45)
    hotspot_reduction = metrics.get('hotspot_count_current', 20) - metrics.get('hotspot_count_scenario', 10)
    
    narrative = f"By 2035, with a {abs(car)*100:.0f}% reduction in car dependence"
    
    if transit > 0:
        narrative += f" and {transit*100:.0f}% increase in transit service"
    if trees > 0:
        narrative += f" combined with {trees*100:.0f}% more urban greening"
    
    narrative += f", Montréal's average city stress index drops by {csi_drop:.0f} points. "
    narrative += f"Stress hotspots decrease from {metrics.get('hotspot_count_current', 20)} to {metrics.get('hotspot_count_scenario', 10)}, "
    narrative += "creating more livable neighborhoods with improved air quality, reduced heat islands, and better access to transit. "
    narrative += "This transformation particularly benefits vulnerable communities, fostering greater urban equity and climate resilience."
    
    return narrative

