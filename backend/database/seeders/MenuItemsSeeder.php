<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemsSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'id' => 'menu_001',
                'name' => 'Nasi Goreng Jawa',
                'category' => 'Makanan',
                'price' => 25000,
                'image' => '/imports/Nasi_Goreng_Jawa.webp',
                'available' => 1,
                'tag' => 'Favorit',
                'description' => 'Nasi goreng khas Jawa, harum bumbu rempah dengan telur mata sapi & acar segar.',
            ],
            [
                'id' => 'menu_002',
                'name' => 'Bakmi Goreng Jawa',
                'category' => 'Makanan',
                'price' => 24000,
                'image' => '/imports/Bakmi_Goreng_Jawa.webp',
                'available' => 1,
                'tag' => null,
                'description' => 'Mie goreng khas Jawa dengan telur, sayuran segar & kecap manis pilihan.',
            ],
            [
                'id' => 'menu_003',
                'name' => 'Bakmi Godog Jawa',
                'category' => 'Makanan',
                'price' => 24000,
                'image' => '/imports/Bakmi_Godog_Jawa.webp',
                'available' => 1,
                'tag' => null,
                'description' => 'Mie rebus kuah kaldu ayam hangat, cocok dinikmati di segala cuaca.',
            ],
            [
                'id' => 'menu_004',
                'name' => 'Soto Ayam Semarang',
                'category' => 'Makanan',
                'price' => 28000,
                'image' => '/imports/Soto_Ayam_Semarang.webp',
                'available' => 1,
                'tag' => 'Best Seller',
                'description' => 'Kuah bening segar dengan ayam suwir, tauge, bihun, dan perasan jeruk nipis.',
            ],
            [
                'id' => 'menu_006',
                'name' => 'Gulai Mangut Semarang',
                'category' => 'Makanan',
                'price' => 35000,
                'image' => '/imports/Gulai_Mangut_Semarang.webp',
                'available' => 1,
                'tag' => 'Spesial',
                'description' => 'Ikan asap dimasak gulai santan kuning rempah khas Semarang, gurih dan kaya cita rasa.',
            ],
            [
                'id' => 'menu_007',
                'name' => 'Nasi Ayam Lengkuas Semarang',
                'category' => 'Makanan',
                'price' => 30000,
                'image' => '/imports/Nasi_Ayam_Lengkuas_Semarang.webp',
                'available' => 1,
                'tag' => 'Best Seller',
                'description' => 'Ayam goreng lengkuas empuk & harum, perpaduan rempah khas Jawa Tengah.',
            ],
            [
                'id' => 'menu_008',
                'name' => 'Nasi Ayam Penyet Semarang',
                'category' => 'Makanan',
                'price' => 30000,
                'image' => '/imports/Nasi_Ayam_Penyet_Semarang.webp',
                'available' => 1,
                'tag' => 'Best Seller',
                'description' => 'Ayam kampung penyet bumbu merah khas Semarang, disajikan dengan nasi hangat & lalapan.',
            ],
            [
                'id' => 'menu_009',
                'name' => 'Es Jeruk Segar',
                'category' => 'Minuman',
                'price' => 12000,
                'image' => '/imports/Es_Jeruk_Segar.webp',
                'available' => 1,
                'tag' => null,
                'description' => 'Perasan jeruk manis segar dengan es batu, pelepas dahaga.',
            ],
        ];

        foreach ($items as $item) {
            MenuItem::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}
