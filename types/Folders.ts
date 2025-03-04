export type Folders = Folder[]

export interface Folder {
  name: string
  path: string
  encodedPath: string
  urls: Urls
  type: string
  children?: Children[]
}

export interface Urls {
  rawUrl: string
  url: string
}

export interface Children {
  name: string
  path: string
  encodedPath: string
  urls: Urls2
  type: string
  children?: Children2[]
}

export interface Urls2 {
  rawUrl: string
  url: string
}

export interface Children2 {
  name: string
  path: string
  encodedPath: string
  urls: Urls3
  type: string
  children?: Children3[]
}

export interface Urls3 {
  rawUrl: string
  url: string
}

export interface Children3 {
  name: string
  path: string
  encodedPath: string
  urls: Urls4
  type: string
}

export interface Urls4 {
  rawUrl: string
  url: string
}
