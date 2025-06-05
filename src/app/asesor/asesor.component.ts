import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VentasService } from '../services/ventas.service';
import { DateTime } from 'luxon';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-asesor',
  templateUrl: './asesor.component.html',
  standalone: false,
  styleUrls: ['./asesor.component.css']
})
export class AsesorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particlesCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  ventas: any[] = [];
    private updateInterval: any;
  private countdownInterval: any;
  private previousVentas: any[] = [];
  countdown: string = '02:00';
  updateFrequency: number = 120; 
  constructor(private ventasService: VentasService) {}

   ngOnInit(): void {
    this.obtenerVentas();
    this.startCountdown();
    this.updateInterval = setInterval(() => {
      this.obtenerVentas();
      this.resetCountdown();
    }, this.updateFrequency * 1000);
  }

   ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

   private startCountdown() {
    let secondsLeft = this.updateFrequency;
    
    this.countdownInterval = setInterval(() => {
      secondsLeft--;
      
      if (secondsLeft < 0) {
        secondsLeft = this.updateFrequency;
      }
      
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      
      this.countdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  private resetCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.startCountdown();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initParticleCanvas();
    });
  }

  private initParticleCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
      }
    }

    const maxParticles = 300;
    const particleDensity = Math.floor((canvas.width * canvas.height) / 15000);
    const particleCount = Math.min(particleDensity, maxParticles);
    const particles = Array.from({ length: particleCount }, () => new Particle());

    let lastFrame = 0;

    const animate = (time: number) => {
      if (time - lastFrame < 33) {
        requestAnimationFrame(animate);
        return;
      }
      lastFrame = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = dx * dx + dy * dy;
          if (distance < 10000) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 191, 255, ${1 - distance / 10000})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    window.addEventListener('resize', resizeCanvas);
  }

obtenerVentas() {
    const fechaLima = moment.tz('America/Lima');
    const fechaLimaDate = fechaLima.toDate(); // Convertir a Date si el backend lo requiere como objeto Date

    this.ventasService.getVentas(fechaLimaDate, fechaLimaDate).subscribe({
        next: (data: any) => {
            const ventasMapeadas = data.datos.map((item: any) => ({
                advisor_name: item.asesor,
                sala: item.sala,
                sales_attended: parseInt(item.atendida),
                number_sales: parseInt(item.total),
                totalugis: parseInt(item.totalugis),
                vxevaluarpre: parseInt(item.vxevaluarpre),
                vxevaluarpost: parseInt(item.vxevaluarpost),
                vxvalidar: parseInt(item.vxvalidar),
                vxprogramar: parseInt(item.vxprogramar),
                vprogramadas: parseInt(item.vprogramadas)
            }));

            ventasMapeadas.sort((a: any, b: any) => {
                if (b.number_sales !== a.number_sales) {
                    return b.number_sales - a.number_sales;
                }
                if (b.vprogramadas !== a.vprogramadas) {
                    return b.vprogramadas - a.vprogramadas;
                }
                return b.sales_attended - a.sales_attended;
            });

            if (JSON.stringify(this.ventas) !== JSON.stringify(ventasMapeadas)) {
                this.previousVentas = [...this.ventas];
                this.ventas = ventasMapeadas;
                console.log('Datos actualizados:', ventasMapeadas);
            }
        },
        error: (err) => {
            console.error('Error al obtener ventas:', err);
        }
    });
}
get ventasTotales(): number {
  return this.ventas.reduce((sum, v) => sum + v.number_sales, 0);
}
isNewRow(index: number): boolean {
    if (!this.previousVentas || this.previousVentas.length === 0) return false;
    
    if (index >= this.previousVentas.length) return true;
    
    const currentVenta = this.ventas[index];
    const previousVenta = this.previousVentas[index];
    
    return JSON.stringify(currentVenta) !== JSON.stringify(previousVenta);
}
}