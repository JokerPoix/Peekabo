<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250114112406 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE bird_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE location_history_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE users_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE bird (id INT NOT NULL, owner_id INT NOT NULL, name VARCHAR(255) NOT NULL, gps_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A0BBAE0EBD6B6DDE ON bird (gps_id)');
        $this->addSql('CREATE INDEX IDX_A0BBAE0E7E3C61F9 ON bird (owner_id)');
        $this->addSql('CREATE TABLE location_history (id INT NOT NULL, bird_id INT NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, timestamp TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C9FF63EFE813F9 ON location_history (bird_id)');
        $this->addSql('CREATE TABLE users (id INT NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, roles JSON NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1483A5E9E7927C74 ON users (email)');
        $this->addSql('ALTER TABLE bird ADD CONSTRAINT FK_A0BBAE0E7E3C61F9 FOREIGN KEY (owner_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE location_history ADD CONSTRAINT FK_C9FF63EFE813F9 FOREIGN KEY (bird_id) REFERENCES bird (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE bird_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE location_history_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE users_id_seq CASCADE');
        $this->addSql('ALTER TABLE bird DROP CONSTRAINT FK_A0BBAE0E7E3C61F9');
        $this->addSql('ALTER TABLE location_history DROP CONSTRAINT FK_C9FF63EFE813F9');
        $this->addSql('DROP TABLE bird');
        $this->addSql('DROP TABLE location_history');
        $this->addSql('DROP TABLE users');
    }
}
