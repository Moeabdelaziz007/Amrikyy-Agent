import R act from 'react';
import { MapPin } from 'lucide-react';

interface SearchResultsProps {
  results: any[];
  onSelect: (result: any) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect }) => {
  if (results.length === 0) {
    return <div className="p-4 text-white/50">No results found.</div>;
  }

  return (
    <div className="space-y-2 p-2">
      {results.map((result) => (
        <div key={result.id} onClick={() => onSelect(result)} className="p-2 bg-white/10 rounded-md hover:bg-white/20 cursor-pointer flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-white">{result.name}</span>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;