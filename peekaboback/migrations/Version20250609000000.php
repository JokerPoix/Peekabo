<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250609000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create bird_reports table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE bird_reports (
            id VARCHAR(36) NOT NULL,
            user_id INT DEFAULT NULL,
            species VARCHAR(255) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            timestamp TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_BIRD_REPORTS_USER ON bird_reports (user_id)');
        $this->addSql('ALTER TABLE bird_reports ADD CONSTRAINT FK_BIRD_REPORTS_USER FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE bird_reports');
    }
}
