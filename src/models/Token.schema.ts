import { ObjectId } from 'mongodb'
import { TokenType as TokenTypeEnum } from '~/constants/enums'
import { Base } from './Base.schema'

export interface TokenData {
  token_id: string
  user_id: ObjectId
  token: string
  type: TokenTypeEnum
  expires_at: Date
  is_removed?: boolean
}

export class Token extends Base {
  token_id: string
  user_id: ObjectId
  token: string
  type: TokenTypeEnum
  expires_at: Date
  is_removed: boolean

  constructor(token: TokenData) {
    super(token)
    this.token_id = token.token_id
    this.user_id = token.user_id
    this.token = token.token
    this.type = token.type
    this.expires_at = token.expires_at
    this.is_removed = token.is_removed || false
  }
}
