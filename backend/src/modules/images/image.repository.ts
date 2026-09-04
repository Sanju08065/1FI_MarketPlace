import { prisma } from '../../db/prisma';

const imageSelect = {
  id: true,
  mimeType: true,
  data: true,
  byteSize: true,
  createdAt: true,
} as const;

/** Fetch image bytes + metadata by id. */
export function findImageById(id: string) {
  return prisma.image.findUnique({ where: { id }, select: imageSelect });
}

/** Fetch image bytes + metadata by stable source key (e.g. "shop-banner"). */
export function findImageByKey(sourceKey: string) {
  return prisma.image.findUnique({ where: { sourceKey }, select: imageSelect });
}
