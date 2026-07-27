<?php

declare(strict_types=1);

namespace App\Models;

class User extends Model 
{
    public function testConnection(): bool
    {
        return $this->db->query('SELECT 1')->fetchColumn() === 1;
    }
}