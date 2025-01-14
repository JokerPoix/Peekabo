<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250114095355 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE bird ADD latitude DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE bird ADD longitude DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE bird RENAME COLUMN location TO gps_id');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A0BBAE0EBD6B6DDE ON bird (gps_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP INDEX UNIQ_A0BBAE0EBD6B6DDE');
        $this->addSql('ALTER TABLE bird DROP latitude');
        $this->addSql('ALTER TABLE bird DROP longitude');
        $this->addSql('ALTER TABLE bird RENAME COLUMN gps_id TO location');
    }
}
