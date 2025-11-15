# Changelog

## [2025-11-15] - Map Page UI Revamp

### Changed

- **Map Page Styling** (`frontend/app/map/page.tsx`)

  - Updated background from slate-900 to black for futuristic theme
  - Added navigation bar with Home button and Map indicator
  - Updated loading and error states with glassmorphism styling
  - All functionality preserved

- **Header Component** (`frontend/components/Header.tsx`)

  - Futuristic glassmorphism design with cyan accents
  - Gradient text for title
  - Glass panel for scenario year indicator
  - Updated colors to match 2035 theme

- **Layer Toggles Component** (`frontend/components/LayerToggles.tsx`)

  - Complete redesign with glassmorphism
  - Cyan-themed checkboxes with hover effects
  - Updated legend styling with borders and better spacing
  - Improved typography and spacing

- **Scenario Controls Component** (`frontend/components/ScenarioControls.tsx`)

  - Futuristic slider styling with gradient backgrounds
  - Glassmorphism panels for impact summary
  - Cyan-themed buttons and borders
  - Updated narrative display with AI branding
  - Improved spacing and typography

- **Cell Details Panel Component** (`frontend/components/CellDetailsPanel.tsx`)
  - Complete UI overhaul with glassmorphism
  - Gradient CSI score display
  - Updated stress bars with gradient fills and shadows
  - Glass panels for all sections
  - Improved intervention cards with better visual hierarchy
  - Cyan color scheme throughout

### Styling Updates

- All components now use glassmorphism effects
- Consistent cyan color scheme (#00ffff / cyan-400)
- Gradient text effects for important values
- Improved shadows and borders
- Better hover states and transitions
- Futuristic slider styling with glow effects

## [2025-11-15] - Futuristic Landing Page Implementation

### Team Information

- **Team:** YVL
- **Members:**
  - Mir Faiyazur Rahman
  - Aarush Patel
  - Amine Baha
  - Tamim Afghanyar
- **Hackathon:** Champlain Code Quest 2025
- **Theme:** "Build the World of Tomorrow"

### Added

- **Landing Page** (`frontend/app/page.tsx`)

  - Beautiful futuristic landing page explaining CityPulse Montréal 2035
  - Hero section with animated title and gradient effects
  - Problem section highlighting urban stress challenges
  - Solution section with City Stress Index (CSI) explanation
  - Features section with spotlight cards showcasing key capabilities
  - Interactive map preview section with 3D scroll animation
  - Hackathon info section (Champlain Code Quest 2025, "Build the World of Tomorrow")
  - Smooth scroll navigation between sections
  - Fully responsive design with futuristic 2035 theme

- **Map Route** (`frontend/app/map/page.tsx`)

  - Moved full interactive map application to `/map` route
  - All existing map functionality preserved
  - Complete CityPulse map experience with all controls

- **Map Preview Component** (`frontend/components/MapPreview.tsx`)

  - Lightweight embedded map preview for landing page
  - Interactive map with view-only functionality
  - Integrated with ContainerScroll animation

- **UI Components** (`frontend/components/ui/`)

  - `button.tsx` - shadcn button component with variants
  - `3d-adaptive-navigation-bar.tsx` - Animated navigation pill with scroll-to-section
  - `container-scroll-animation.tsx` - Scroll-triggered 3D card animation
  - `background-paths.tsx` - Animated background paths (not used in final design)
  - `spotlight-card.tsx` - Glow card with spotlight effect for feature cards

- **Utilities** (`frontend/lib/utils.ts`)
  - `cn()` helper function for className merging (shadcn/ui standard)

### Changed

- **Project Structure**
  - Landing page now at root (`/`)
  - Map application moved to `/map` route
  - Improved separation of concerns

### Dependencies Added

- `@radix-ui/react-slot` - For button component
- `class-variance-authority` - For component variants
- `clsx` - For className utilities
- `tailwind-merge` - For merging Tailwind classes

### Design Features

- Futuristic 2035 theme with dark background and cyan accents
- Glassmorphism effects on cards and panels
- Smooth animations using Framer Motion
- Responsive layout for mobile, tablet, and desktop
- Interactive navigation with scroll-to-section
- 3D scroll effects on map preview
- Spotlight glow effects on feature cards

### Navigation

- Fixed navigation bar at top with smooth scroll-to-section
- Sections: Home, Problem, Solution, Features, Map, About
- Active section detection based on scroll position
- Hover expansion with smooth animations
