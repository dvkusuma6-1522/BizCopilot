import React from 'react';
import {
  Store,
  Pill,
  Shirt,
  Utensils,
  Apple,
  Wrench,
  Smartphone,
  Truck,
  BookOpen,
  Scissors,
  Factory,
  Layers,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  iconName: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, ...props }) => {
  switch (iconName) {
    case 'Pill':
      return <Pill {...props} />;
    case 'Shirt':
      return <Shirt {...props} />;
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Apple':
      return <Apple {...props} />;
    case 'Wrench':
      return <Wrench {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Truck':
      return <Truck {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Scissors':
      return <Scissors {...props} />;
    case 'Factory':
      return <Factory {...props} />;
    case 'Layers':
      return <Layers {...props} />;
    case 'Store':
    default:
      return <Store {...props} />;
  }
};
