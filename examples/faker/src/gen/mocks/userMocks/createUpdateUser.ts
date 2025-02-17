import { faker } from '@faker-js/faker'

import { createUser } from '../createUser'
import { UpdateUserError } from '../../models/UpdateUser'
import { UpdateUserMutationResponse } from '../../models/UpdateUser'
import { UpdateUserPathParams } from '../../models/UpdateUser'
import { UpdateUserMutationRequest } from '../../models/UpdateUser'

/**
 * @description successful operation
 */

export function createUpdateUserError(): UpdateUserError {
  return undefined
}

export function createUpdateUserMutationResponse(): UpdateUserMutationResponse {
  return undefined
}

export function createUpdateUserPathParams(): UpdateUserPathParams {
  return { username: faker.string.alpha() }
}

/**
 * @description Update an existent user in the store
 */

export function createUpdateUserMutationRequest(): UpdateUserMutationRequest {
  return createUser()
}
