export type WorkImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  thumbnail?: string;
};

export type WorkProject = {
  slug: string;
  name: string;
  category: string;
  description: string;
  launch: string;
  role: string;
  cover: WorkImage;
  images: readonly WorkImage[];
  liveUrl: string | null;
  sourceAuthor: string | null;
  sourceUrl: string | null;
};
