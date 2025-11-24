# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- Initial release of Spring Boot TS
- JPA-like entity decorators (`@Entity`, `@Table`, `@Column`, `@Id`, `@GeneratedValue`)
- Advanced mapping decorators (`@JoinColumn`, `@JoinTable`, `@MappedSuperclass`, `@Embedded`, `@Transient`, `@Enumerated`, `@Temporal`)
- Relationship decorators (`@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@OneToOne`)
- EntityManager with CRUD operations
- Repository pattern with BaseRepository
- RelationshipManager for loading relationships
- Dependency injection container with `@Service`, `@Controller`, `@Component`, `@Repository`
- Lombok-style decorators (`@Data`, `@Getter`, `@Setter`, `@Builder`, `@ToString`, `@EqualsAndHashCode`)
- RESTful web framework with `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- MySQL integration with connection pooling
- Auto schema generation from entity metadata
- Query builder for custom queries
- Full TypeScript and JavaScript support
- Express.js integration
- Comprehensive documentation and examples

### Features
- Automatic database and table creation
- EAGER/LAZY relationship loading
- Parameter injection in controllers
- Configuration value injection
- Type-safe queries
- Transaction support ready

