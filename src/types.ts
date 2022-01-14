import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
}

export const defaultQuery: Partial<MyQuery> = {
  constant: 6.5,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  notionDbId: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  notionApiKey: string;
}

export interface Page {
  id: string;
  properties: {
    Name: {
      title: Array<{
        text: {
          content: string;
        };
      }>;
    };
    Amount: {
      number: number;
    };
    Date: {
      date: {
        start: string;
      };
    };
    Category: {
      multi_select: Array<{
        name: string;
      }>;
    };
  };
}

export interface Expense {
  name: string;
  amount: number;
  date: Date;
  tags: string[];
}
