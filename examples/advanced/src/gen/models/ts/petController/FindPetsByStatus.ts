import type { Pet } from '../Pet'

/**
 * @description Invalid status value
 */
export type FindPetsByStatus400 = any | null

export const FindPetsByStatusQueryParamsStatus = {
  available: 'available',
  pending: 'pending',
  sold: 'sold',
} as const
export type FindPetsByStatusQueryParamsStatus = (typeof FindPetsByStatusQueryParamsStatus)[keyof typeof FindPetsByStatusQueryParamsStatus]
export type FindPetsByStatusQueryParams = {
  /**
   * @type string | undefined
   * @default 'available'
   */
  status?: FindPetsByStatusQueryParamsStatus | undefined
}

/**
 * @description successful operation
 */
export type FindPetsByStatusQueryResponse = Pet[]
