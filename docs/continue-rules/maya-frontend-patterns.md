---
description: Maya Travel Agent Frontend Development Patterns
---

# Frontend React + TypeScript Rules

## Component Structure (MANDATORY)

**All components must:**
- Be functional (no class components)
- Have TypeScript interfaces for props
- Use custom hooks for business logic
- Be in PascalCase naming

## Code Patterns

### Props Interface
```typescript
// ✅ GOOD
interface TripCardProps {
  trip: Trip;
  onSelect: (id: string) => void;
  className?: string;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onSelect, className }) => {
  // Component implementation
};

// ❌ BAD - No TypeScript interface
export const TripCard = ({ trip, onSelect }) => { ... };
```

### Custom Hooks for Logic
```typescript
// ✅ GOOD - Logic in custom hook
export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    tripService.getAll().then(setTrips);
  }, []);
  
  return { trips, loading };
};

// Component stays clean
export const TripList: React.FC = () => {
  const { trips, loading } = useTrips();
  return <div>{trips.map(trip => <TripCard key={trip.id} trip={trip} />)}</div>;
};

// ❌ BAD - Logic in component
export const TripList = () => {
  const [trips, setTrips] = useState([]);
  useEffect(() => { fetch('/api/trips')... }, []); // Logic in component!
};
```

### State Management
- Use React Query for server state
- Use Context API for global UI state
- Use local useState for component-specific state

### Styling
- Use TailwindCSS utility classes
- Use Framer Motion for animations
- Responsive design (mobile-first)
