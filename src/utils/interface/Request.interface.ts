import { ObjectId } from 'mongodb'

export interface IRequestTokenType {
  _id?: ObjectId
  token: string
  createdAt?: Date
  userId: ObjectId
}
