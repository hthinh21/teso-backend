import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../core/base.entity';

@Entity('rewards')
export class Reward extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', default: 0 })
  pointsCost: number;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;
}
