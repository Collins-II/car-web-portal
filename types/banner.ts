export type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
};
