import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  proxyUrl?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.proxyUrl = instanceSettings.url;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();
    const requestUrl = this.proxyUrl + '/expenses/query';

    // Return a constant for each query.
    const promises = options.targets.map((target) => {
      const query = defaults(target, defaultQuery);
      const promise = getBackendSrv().datasourceRequest({
        url: requestUrl,
        method: 'POST',
        data: {
          filter: {
            and: [
              { property: 'Date', date: { on_or_after: new Date(from).toISOString() } },
              { property: 'Date', date: { on_or_before: new Date(to).toISOString() } },
            ],
          },
          sorts: [
            {
              property: 'Date',
              direction: 'descending',
            },
          ],
        },
      });
      return promise.then((response) => {
        if (response.status !== 200) {
          throw new Error('Failed to retrieve expenses from Notion');
        }
        const expenses = response.data.results.map((page: any) => ({
          id: page.id,
          name: page.properties.Name.title[0].text.content,
          amount: page.properties.Amount.number,
          date: new Date(page.properties.Date.date.start).getTime(),
          tags: page.properties.Category.multi_select.map((t: any) => t.name),
        }));
        return new MutableDataFrame({
          refId: query.refId,
          fields: [
            { name: 'Date', type: FieldType.time, values: expenses.map((e: any) => e.date) },
            { name: 'Amount', type: FieldType.number, values: expenses.map((e: any) => e.amount) },
          ],
        });
      });
    });

    return { data: await Promise.all(promises) };
  }

  async testDatasource() {
    // Implement a health check for your data source.
    const requestUrl = this.proxyUrl + '/expenses';
    const response = await getBackendSrv().datasourceRequest({
      url: requestUrl,
      method: 'GET',
    });
    return response.status === 200
      ? { status: 'success', message: 'Your Notion DB is reachable!' }
      : { status: 'failure', message: 'We cannot reach your Notion DB' };
  }
}
