/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface ICliConfig {
  ethereum: {
    /**
     * Network endpoint URL
     */
    endpoint: string;
    /**
     * Directory where contract deployment lock files stored
     */
    lockfilesDir: string;
    /**
     * Network from address
     */
    from: string;
    /**
     * Default Gas limit
     */
    gas: string;
    /**
     * Default Gas price
     */
    gasPrice: string;
    /**
     * Some pkey
     */
    pkey: string;
    /**
     * test contract
     */
    ECRecoverTest: {
      /**
       * Path to the contract schema
       */
      schema: string;
      [k: string]: any;
    };
    [k: string]: any;
  };
  [k: string]: any;
}
