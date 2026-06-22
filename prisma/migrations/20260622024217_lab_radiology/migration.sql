-- CreateEnum
CREATE TYPE "lab_category" AS ENUM ('LABORATORIUM', 'RADIOLOGI');

-- CreateEnum
CREATE TYPE "lab_order_status" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "lab_flag" AS ENUM ('NORMAL', 'LOW', 'HIGH', 'ABNORMAL');

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "order_number" TEXT NOT NULL,
    "category" "lab_category" NOT NULL DEFAULT 'LABORATORIUM',
    "status" "lab_order_status" NOT NULL DEFAULT 'REQUESTED',
    "clinical_note" TEXT,
    "ordered_by_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_order_items" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "result" TEXT,
    "unit" TEXT,
    "reference_range" TEXT,
    "flag" "lab_flag",
    "note" TEXT,

    CONSTRAINT "lab_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lab_orders_tenant_id_status_idx" ON "lab_orders"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "lab_orders_patient_id_idx" ON "lab_orders"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "lab_orders_tenant_id_order_number_key" ON "lab_orders"("tenant_id", "order_number");

-- CreateIndex
CREATE INDEX "lab_order_items_lab_order_id_idx" ON "lab_order_items"("lab_order_id");

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
