-- DropIndex
DROP INDEX "Checklist_userId_date_key";

-- AlterTable
ALTER TABLE "medical_forms" ADD COLUMN     "codeService" TEXT;
