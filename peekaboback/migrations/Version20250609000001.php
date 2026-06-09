<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250609000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add photo_path column to bird_reports';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE bird_reports ADD photo_path VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE bird_reports DROP photo_path');
    }
}
