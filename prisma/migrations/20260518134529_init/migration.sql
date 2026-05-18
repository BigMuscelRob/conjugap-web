-- CreateTable
CREATE TABLE "Verb" (
    "id" SERIAL NOT NULL,
    "infinitive" TEXT NOT NULL,
    "cls" TEXT NOT NULL,
    "irregular" BOOLEAN NOT NULL DEFAULT false,
    "meaningDe" TEXT NOT NULL,
    "meaningEn" TEXT NOT NULL,

    CONSTRAINT "Verb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conjugation" (
    "id" SERIAL NOT NULL,
    "verbId" INTEGER NOT NULL,
    "tense" TEXT NOT NULL,
    "pronoun" TEXT NOT NULL,
    "form" TEXT NOT NULL,

    CONSTRAINT "Conjugation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verb_infinitive_key" ON "Verb"("infinitive");

-- AddForeignKey
ALTER TABLE "Conjugation" ADD CONSTRAINT "Conjugation_verbId_fkey" FOREIGN KEY ("verbId") REFERENCES "Verb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
