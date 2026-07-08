-- CreateEnum
CREATE TYPE "medical_document_type" AS ENUM ('SICK_NOTE', 'REFERRAL');

-- CreateTable
CREATE TABLE "medical_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "doctor_id" TEXT NOT NULL,
    "type" "medical_document_type" NOT NULL,
    "number" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_documents_tenant_id_created_at_idx" ON "medical_documents"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "medical_documents_encounter_id_idx" ON "medical_documents"("encounter_id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_documents_tenant_id_number_key" ON "medical_documents"("tenant_id", "number");

-- AddForeignKey
ALTER TABLE "medical_documents" ADD CONSTRAINT "medical_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
