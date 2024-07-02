export interface BookDetails {
  key: string;
  title: string;
  description?: string;
  covers?: number[];
  subjects?: string[];
  subject_people?: string[];
  authors?: {
    author: {
      key: string;
    };
    type: {
      key: string;
    };
  }[];
  type: {
    key: string;
  };
  latest_revision: number;
  revision: number;
  created: {
    type: string;
    value: string;
  };
  last_modified: {
    type: string;
    value: string;
  };
}
