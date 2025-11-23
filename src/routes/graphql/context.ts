import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export function createContext(prisma: PrismaClient) {
  return {
    prisma,
    postsLoader: new DataLoader(async (userIds) => {
      const posts = await prisma.post.findMany({
        where: {
          authorId: {
            in: userIds as string[],
          },
        },
      });
      return userIds.map((id) => posts.filter((post) => post.authorId === id));
    }),
    memberTypesLoader: new DataLoader(async (profileMemberTypeId) => {
      const memberTypes = await prisma.memberType.findMany({
        where: {
          id: {
            in: profileMemberTypeId as string[],
          },
        },
      });
      return profileMemberTypeId.map((id) =>
        memberTypes.find((memberType) => memberType.id === id),
      );
    }),
    profileLoader: new DataLoader(async (userIds) => {
      const profiles = await prisma.profile.findMany({
        where: {
          userId: {
            in: userIds as string[],
          },
        },
      });
      return userIds.map((id) => profiles.find((post) => post.userId === id));
    }),
    userSubscriptions: new DataLoader(async (userIds) => {
      const userSubscriptions = await prisma.user.findMany({
        where: {
          subscribedToUser: {
            some: {
              subscriberId: {
                in: userIds as string[],
              },
            },
          },
        },
        include: {
          subscribedToUser: true,
        },
      });
      return userIds.map((id) =>
        userSubscriptions.filter((user) =>
          user.subscribedToUser.some((user) => user.subscriberId === id),
        ),
      );
    }),
    userSubscribers: new DataLoader(async (userIds) => {
      const userSubscribers = await prisma.user.findMany({
        where: {
          userSubscribedTo: {
            some: {
              authorId: {
                in: userIds as string[],
              },
            },
          },
        },
        include: {
          userSubscribedTo: true,
        },
      });
      return userIds.map((id) =>
        userSubscribers.filter((user) =>
          user.userSubscribedTo.some((user) => user.authorId === id),
        ),
      );
    }),
  };
}
