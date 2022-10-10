import axiosStatic, { type AxiosInstance } from 'axios';
import { DriveFileUploader } from '~/structures/DriveFileUploader';
import { assertIsProjectKey } from '~/util/project-key';

type DriveOptions = Readonly<{
  name: string,
  projectKey: string
}>;

type PutFileOptions = Readonly<{
  contentType?: string
}>;

type DeleteFilesResponse<N extends string = string> = Readonly<{
  deleted: readonly N[],
  failed: Readonly<Record<N, string>>
}>;

type ListFilesOptionsWithoutLimit<N extends string = string> = Readonly<Partial<{
  last: N,
  prefix: string
}>>;

type ListFilesOptionsWithLimit<N extends string = string> = ListFilesOptionsWithoutLimit<N> & Readonly<Partial<Record<'limit', number>>>;

type ListFilesResponseWithoutPaging<N extends string = string> = Readonly<{
  names: readonly N[]
}>;

type ListFilesResponseWithPaging<N extends string = string> = ListFilesResponseWithoutPaging<N> & Readonly<Record<'paging', Readonly<{
  last: N,
  size: number
}>>>;

class Drive<N extends string = string> {
  readonly #axios: AxiosInstance;

  constructor({ name, projectKey }: DriveOptions) {
    assertIsProjectKey(projectKey);

    const projectId = projectKey.split('_')[0];

    this.#axios = axiosStatic.create({
      baseURL: `https://drive.deta.sh/v1/${projectId}/${encodeURIComponent(name)}`,
      headers: {
        'X-API-Key': projectKey
      }
    });
  }

  async get(name: N): Promise<Uint8Array> {
    const { data } = await this.#axios.get<Uint8Array>('files/download', {
      params: {
        name
      },
      responseType: 'arraybuffer'
    });

    return data;
  }

  async put(name: N, data: Uint8Array, { contentType }: PutFileOptions = {}): Promise<void> {
    const uploader = new DriveFileUploader<N>({
      axios: this.#axios,
      contentType,
      data,
      name
    });

    await uploader.upload();
  }

  async list(options?: ListFilesOptionsWithoutLimit): Promise<ListFilesResponseWithoutPaging>;
  async list(options: ListFilesOptionsWithLimit): Promise<ListFilesResponseWithPaging>;
  async list({ last, limit, prefix }: ListFilesOptionsWithLimit | ListFilesOptionsWithLimit): Promise<ListFilesResponseWithoutPaging | ListFilesResponseWithPaging> {
    const { data } = await this.#axios.get<ListFilesResponseWithoutPaging | ListFilesResponseWithPaging>('files', {
      params: {
        last,
        limit,
        prefix
      }
    });

    return data;
  }

  async delete(name: N): Promise<DeleteFilesResponse>;
  async delete(names: readonly N[]): Promise<DeleteFilesResponse>;
  async delete(arg: N | readonly N[]): Promise<DeleteFilesResponse> {
    const names = Array.isArray(arg) ? arg : [arg];

    if (!names.length) {
      throw new RangeError('The file name to be deleted is not specified');
    }

    if (names.length > 1000) {
      throw new RangeError('Cannot delete more than 1000 files at a time');
    }

    const { data } = await this.#axios.delete<DeleteFilesResponse>('files', {
      data: {
        names
      }
    });

    return data;
  }
}

export {
  type DeleteFilesResponse,
  Drive,
  type DriveOptions,
  type ListFilesOptionsWithLimit,
  type ListFilesOptionsWithoutLimit,
  type ListFilesResponseWithPaging,
  type ListFilesResponseWithoutPaging,
  type PutFileOptions
};
