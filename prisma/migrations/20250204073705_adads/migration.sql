/*
  Warnings:

  - You are about to drop the `_UserRooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserRooms" DROP CONSTRAINT "_UserRooms_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserRooms" DROP CONSTRAINT "_UserRooms_B_fkey";

-- DropTable
DROP TABLE "_UserRooms";
