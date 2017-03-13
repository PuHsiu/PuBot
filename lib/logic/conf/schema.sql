USE `bot`

DROP TABLE IF EXISTS `conference`;
CREATE TABLE `conference` (
    serve_id    CHAR(32)        NOT NULL,
    event_name  CHAR(32)       NOT NULL,
    regist_list BINARY(64)    NOT NULL,
    PRIMARY KEY (serve_id)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
