-- CreateTable
CREATE TABLE "User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TravelRecord" (
    "travelRecordId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Travel" (
    "travelId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "travelRecordId" INTEGER NOT NULL,
    CONSTRAINT "Travel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Travel_travelRecordId_fkey" FOREIGN KEY ("travelRecordId") REFERENCES "TravelRecord" ("travelRecordId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Photo" (
    "photoId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL,
    "travelRecordId" INTEGER NOT NULL,
    CONSTRAINT "Photo_travelRecordId_fkey" FOREIGN KEY ("travelRecordId") REFERENCES "TravelRecord" ("travelRecordId") ON DELETE RESTRICT ON UPDATE CASCADE
);
