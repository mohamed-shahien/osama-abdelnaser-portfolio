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
  /** The project type, such as "Salla Store" or "Web Platform". */
  category: string;
  /** One line for the gallery card. */
  summary: string;
  /** The full description for the case page. */
  description: string;
  /** The month the project was delivered, such as "Aug 2026". */
  date: string;
  /** The devices and directions the design covers. */
  support: string;
  cover: WorkImage;
  images: readonly WorkImage[];
  liveUrl: string | null;
  behanceUrl: string | null;
};
