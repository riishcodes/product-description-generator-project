import { WritingTone, DescriptionLength } from '../types';

export interface ProductPreset {
  id: string;
  name: string;
  category: string;
  features: string;
  audience1: string;
  audience2: string;
  tone: WritingTone;
  length: DescriptionLength;
}

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: 'headphones',
    name: 'Wireless Headphones',
    category: 'Audio',
    features: 'Bluetooth connectivity\nLightweight design\nCushioned ear pads\nBuilt-in microphone',
    audience1: 'Students',
    audience2: 'Working professionals',
    tone: 'Friendly and engaging',
    length: 'short',
  },
  {
    id: 'chair',
    name: 'Ergonomic Office Chair',
    category: 'Workplace',
    features: 'Adjustable lumbar support\nBreathable mesh backrest\nPneumatic height adjustment\n360-degree swivel casters',
    audience1: 'Working professionals',
    audience2: 'Budget-conscious buyers',
    tone: 'Professional and informative',
    length: 'medium',
  },
  {
    id: 'tracker',
    name: 'Smart Activity Tracker',
    category: 'Wearables',
    features: 'Optical heart rate monitoring\nStep and daily movement counter\nSleep duration tracking\nWater-resistant silicone strap',
    audience1: 'Everyday consumers',
    audience2: 'Tech enthusiasts',
    tone: 'Persuasive and sales-focused',
    length: 'short',
  },
  {
    id: 'tumbler',
    name: 'Insulated Travel Tumbler',
    category: 'Lifestyle',
    features: 'Double-wall vacuum insulation\nFood-grade stainless steel construction\nSplash-resistant slide lid\nVehicle cup holder compatible base',
    audience1: 'Everyday consumers',
    audience2: 'Luxury buyers',
    tone: 'Friendly and engaging',
    length: 'short',
  },
];

