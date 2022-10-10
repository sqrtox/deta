import axiosStatic, { type AxiosInstance } from 'axios';
import { isArray } from '~/util/isArray';
import { assertIsProjectKey } from '~/util/project-key';

type BasePrimitiveType = boolean | number | string;
type BaseNullishType = null | undefined;
type BaseArrayType = readonly BaseType[];
type BaseObjectType = Readonly<{
  [x: string]: BaseType
}>;
type BaseType = BaseArrayType | BaseNullishType | BaseObjectType | BasePrimitiveType;

type BaseItem<K extends string = string, V extends BaseObjectType = BaseObjectType> = Readonly<{
  key: K,
  /**
   * The expiration date of the item in UNIX time.
   * ```js
   * const date = new Date('2022-10-07T08:00:00.000Z');
   *
   * // This item will expire in 1 second at `2022-10-07T08:00:01.000Z`.
   * base.put({
   *   key: 'item',
   *   __expires: Math.floor(date.getTime() / 1000) + 1
   * });
   * ```
   */
  __expires?: number
}> & V;
type BaseItems<K extends string = string, V extends BaseObjectType = BaseObjectType> = readonly BaseItem<K, V>[];

type EncodeKey = (key: string) => string;

type BaseOptions = Readonly<{
  name: string,
  projectKey: string,
  encodeKey?: EncodeKey
}>;

type BasePutItemsResponse<K extends string = string, V extends BaseObjectType = BaseObjectType> = Readonly<{
  [k in 'failed' | 'processed']: Readonly<{
    items: BaseItems<K, V>
  }>
}>;

type BaseItemUpdates = Readonly<Partial<{
  append: Readonly<Record<string, readonly string[]>>,
  delete: readonly string[],
  increment: Readonly<Record<string, number>>,
  prepend: Readonly<Record<string, readonly string[]>>,
  set: BaseObjectType
}>>;

type BaseAndQuery = Readonly<{
  [x: string]: BaseAndQuery | BaseType
}>;
type BaseOrQuery = readonly BaseQuery[];
type BaseQuery = BaseAndQuery | BaseOrQuery;
type BaseQueryResponse<K extends string = string, V extends BaseObjectType = BaseObjectType> = Readonly<{
  items: BaseItems<K, V>,
  paging: Readonly<{
    last: K,
    size: number
  }>
}>;
type BaseQueryOptions<K extends string = string> = Readonly<Partial<{
  last: K,
  limit: number
}>>;

class Base<K extends string = string, V extends BaseObjectType = BaseObjectType> {
  readonly ['constructor'] = Base;
  readonly #encodeKey: EncodeKey;
  readonly #axios: AxiosInstance;

  constructor({
    name,
    projectKey,
    encodeKey = (key: string) => encodeURIComponent(key)
  }: BaseOptions) {
    assertIsProjectKey(projectKey);

    const projectId = projectKey.split('_')[0];

    this.#encodeKey = encodeKey;
    this.#axios = axiosStatic.create({
      baseURL: `https://database.deta.sh/v1/${projectId}/${encodeURIComponent(name)}`,
      headers: {
        'X-API-Key': projectKey
      }
    });
  }

  async put(item: BaseItem<K, V>): Promise<BasePutItemsResponse>;
  async put(items: BaseItems<K, V>): Promise<BasePutItemsResponse>;
  async put(arg: BaseItem<K, V> | BaseItems<K, V>): Promise<BasePutItemsResponse> {
    const items = (
      isArray(arg)
        ? arg
        : [arg]
    );

    const { data } = await this.#axios.put('items', { items });

    return data;
  }

  async get(key: string): Promise<BaseItem<K, V>> {
    const { data } = await this.#axios.get<BaseItem<K, V>>(`items/${this.#encodeKey(key)}`);

    return data;
  }

  async delete(key: K): Promise<void> {
    await this.#axios.delete(`items/${this.#encodeKey(key)}`);
  }

  async insert(item: BaseItem<K, V>): Promise<void> {
    await this.#axios.post('items', { item });
  }

  async update(key: K, updates: BaseItemUpdates): Promise<void> {
    await this.#axios.patch(`items/${this.#encodeKey(key)}`, updates);
  }

  async query(queries?: readonly BaseQuery[], options: BaseQueryOptions = {}): Promise<BaseQueryResponse<K, V>> {
    const { data } = await this.#axios.post('query', {
      query: queries,
      ...options
    });

    return data;
  }
}

export {
  Base,
  type BaseAndQuery,
  type BaseArrayType,
  type BaseItem,
  type BaseItemUpdates,
  type BaseItems,
  type BaseNullishType,
  type BaseObjectType,
  type BaseOptions,
  type BaseOrQuery,
  type BasePrimitiveType,
  type BasePutItemsResponse,
  type BaseQuery,
  type BaseQueryOptions,
  type BaseQueryResponse,
  type BaseType,
  type EncodeKey
};
