import { type AxiosInstance } from 'axios';

/**
 * @template N Name: Specifies the name of the file.
 */
type DriveFileUploaderOptions<N extends string = string> = Readonly<{
  axios: AxiosInstance,
  data: Uint8Array,
  name: N,
  contentType?: string
}>;

type InitResponse<N extends string = string> = Readonly<{
  drive_name: string,
  name: N,
  projectId: string,
  upload_id: string
}>;

/**
 * It is a one-upload, disposable uploader.
 * @template N Name: Specifies the name of the file.
 * @template I Initialized: The uploader has been initialized or not. **Used internally only. DO NOT TOUCH.**
 * @template A Aborted: Is the upload interrupted or not. **Used internally only. DO NOT TOUCH.**
 * @template C Completed: Whether the upload is complete or not. **Used internally only. DO NOT TOUCH.**
 */
class DriveFileUploader<
  N extends string = string,
  I extends boolean = false,
  A extends boolean = false,
  C extends boolean = false
> {
  readonly ['constructor'] = DriveFileUploader;
  readonly #axios: AxiosInstance;
  readonly #contentType: string;
  readonly #contentLength: number;
  readonly #data: Uint8Array;
  readonly #name: N;

  constructor({
    axios,
    contentType = 'application/octet-stream',
    data,
    name
  }: DriveFileUploaderOptions<N>) {
    this.#axios = axios;
    this.#contentType = contentType;
    this.#data = data;
    this.#contentLength = data.byteLength;
    this.#name = name;
  }

  #uploadId = undefined as I extends true ? string : string | undefined;

  #assertIsInitialized(): asserts this is DriveFileUploader<N, true, A, C> {
    if (!this.#uploadId) {
      throw new TypeError('Uploader is not initialized');
    }
  }

  #assertIsNotInitialized(): asserts this is DriveFileUploader<N, false, A, C> {
    if (this.#uploadId) {
      throw new TypeError('Uploader is already initialized');
    }
  }

  #aborted = false as A;

  #assertIsAborted(): asserts this is DriveFileUploader<N, I, true, C> {
    if (!this.#aborted) {
      throw new TypeError('Uploader is not aborted');
    }
  }

  #assertIsNotAborted(): asserts this is DriveFileUploader<N, I, false, C> {
    if (this.#aborted) {
      throw new TypeError('Uploader is already aborted');
    }
  }

  #completed = false as C;

  #assertIsCompleted(): asserts this is DriveFileUploader<N, I, A, true> {
    if (!this.#completed) {
      throw new TypeError('Uploader is not completed');
    }
  }

  #assertIsNotCompleted(): asserts this is DriveFileUploader<N, I, A, false> {
    if (this.#completed) {
      throw new TypeError('Uploader is already completed');
    }
  }

  async #init(): Promise<void> {
    this.#assertIsNotInitialized();

    const { data } = await this.#axios.post<InitResponse<N>>('uploads', undefined, {
      headers: {
        'Content-Type': this.#contentType
      },
      params: {
        name: this.#name
      }
    });

    this.#uploadId = data.upload_id;
  }

  static readonly #MAX_CHUNK_SIZE = 10 * 1024 * 1024;

  #chunkStart = 0;
  #part = 1;

  async #chunk(): Promise<void> {
    this.#assertIsInitialized();
    this.#assertIsNotAborted();
    this.#assertIsNotCompleted();

    const MAX_CHUNK_SIZE = this.constructor.#MAX_CHUNK_SIZE;
    const chunkStart = this.#chunkStart;
    const contentLength = this.#contentLength;
    const chunkEnd = Math.min(chunkStart + MAX_CHUNK_SIZE, contentLength);
    const chunk = this.#data.slice(chunkStart, chunkEnd);

    await this.#axios.post(`uploads/${this.#uploadId}/parts`, chunk, {
      headers: {
        'Content-Type': this.#contentType
      },
      params: {
        name: this.#name,
        part: (this.#part++).toString()
      }
    });

    this.#chunkStart += MAX_CHUNK_SIZE;
  }

  async #abort(): Promise<void> {
    this.#assertIsInitialized();
    this.#assertIsNotAborted();
    this.#assertIsNotCompleted();

    await this.#axios.delete(`uploads/${this.#uploadId}`, {
      params: {
        name: this.#name
      }
    });

    (this as unknown as DriveFileUploader<N, I, true, C>).#aborted = true;
  }

  async #complete(): Promise<void> {
    this.#assertIsInitialized();
    this.#assertIsNotAborted();
    this.#assertIsNotCompleted();

    await this.#axios.patch(`uploads/${this.#uploadId}`, undefined, {
      params: {
        name: this.#name
      }
    });
  }

  async upload(): Promise<void> {
    this.#assertIsNotInitialized();
    this.#assertIsNotAborted();
    this.#assertIsNotCompleted();

    try {
      await this.#init();

      while (this.#chunkStart < this.#contentLength) {
        await this.#chunk();
      }

      await this.#complete();
    } catch {
      await this.#abort();
    }
  }
}

export {
  DriveFileUploader,
  type DriveFileUploaderOptions,
  type InitResponse
};
