/*
  Warnings:

  - You are about to drop the `Demo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Demo";

-- CreateTable
CREATE TABLE "Demo2" (
    "id" SERIAL NOT NULL,
    "mail" TEXT NOT NULL,

    CONSTRAINT "Demo2_pkey" PRIMARY KEY ("id")
);
