/* eslint-disable @typescript-eslint/no-explicit-any */

declare function resolve(schema: any): Promise<any>
declare function generate(schema: any): any

export = {
    resolve,
    generate
}
