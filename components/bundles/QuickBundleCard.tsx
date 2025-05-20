import React from 'react';
import { BundleItem } from '@/contexts/AIAssistantContext';

interface QuickBundleCardProps {
  bundle: BundleItem;
}

const QuickBundleCard: React.FC<QuickBundleCardProps> = ({ bundle }) => {
  const { title, description, products, price, discount, bestDay } = bundle;

  const discountedPrice = price - (price * discount / 100);

  return (
    <div className="ai-bundle-card">
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm">{title}</h3>
          <div className="flex flex-col items-end">
            <span className="text-xs line-through text-muted-foreground">${price.toFixed(2)}</span>
            <span className="text-sm font-bold">${discountedPrice.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="flex items-center mt-2">
          <span className="text-xs bg-bundle/10 text-bundle-dark px-2 py-1 rounded-full">
            Best on {bestDay}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickBundleCard;