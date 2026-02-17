import { createPool, type Pool } from "mysql2/promise";

export const createTestPool = (): Pool => {
	return createPool({
		host: "127.0.0.1",
		user: "test_user",
		password: "test_password",
		database: "test_db",
		port: 3307,
		waitForConnections: true,
		connectionLimit: 10,
	});
};

export const seedMarketTable = async (pool: Pool): Promise<void> => {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS market (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			chain_id ENUM('1', '56'),
			total_supply_cents BIGINT NOT NULL,
			total_borrow_cents BIGINT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await pool.query(`
		INSERT INTO market (name, chain_id, total_supply_cents, total_borrow_cents) VALUES
		('Token A', '1', 1000, 300),
		('Token B', '56', 2500, 1200),
		('Token C', '56', 500, 200);
	`);
};
