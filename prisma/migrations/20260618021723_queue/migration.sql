-- CreateEnum
CREATE TYPE "service_type" AS ENUM ('BPJS', 'ASURANSI', 'UMUM');

-- CreateEnum
CREATE TYPE "queue_status" AS ENUM ('WAITING', 'CALLED', 'SERVED', 'SKIPPED');

-- CreateTable
CREATE TABLE "queue_tickets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "service_type" "service_type" NOT NULL,
    "number" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "queue_status" NOT NULL DEFAULT 'WAITING',
    "counter" TEXT,
    "called_by_id" TEXT,
    "called_at" TIMESTAMP(3),
    "served_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "queue_tickets_tenant_id_status_idx" ON "queue_tickets"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "queue_tickets_tenant_id_created_at_idx" ON "queue_tickets"("tenant_id", "created_at");

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
