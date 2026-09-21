-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "TokenCrefaz" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenCrefaz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropostaCrefaz" (
    "id" SERIAL NOT NULL,
    "crefazProcessoId" INTEGER,
    "crefazPropostaId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "motivoReprovacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropostaCrefaz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropostaCrefaz_crefazPropostaId_key" ON "PropostaCrefaz"("crefazPropostaId");

