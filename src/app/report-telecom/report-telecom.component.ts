import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VentasService } from '../services/ventas.service';
import { DateTime } from 'luxon';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-asesor',
  templateUrl: 'report-telecom.component.html',
  standalone: false,
  styleUrls: ['report-telecom.component.css']
})
export class ReportTelecomComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particlesCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  ventas2: any[] = [];
  ventas4: any[] = [];
  instaladas: any[] = [];
  private updateInterval: any;
  private countdownInterval: any;
  private previousVentas2: any[] = [];
  private previousVentas4: any[] = [];
  countdown: string = '02:00';
  updateFrequency: number = 120;
  constructor(private ventasService: VentasService) {}

   ngOnInit(): void {
    this.obtenerVentasSala2();
    this.obtenerVentasIntaladas();
    this.obtenerVentasSala4();
    this.startCountdown();
    this.updateInterval = setInterval(() => {
      this.obtenerVentasSala2();
      this.obtenerVentasSala4();
      this.obtenerVentasIntaladas();
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

  obtenerVentasSala2() {
    const fechaLima = moment.tz('America/Lima').startOf('day');
    const fechaLimaDateInicio = fechaLima.toDate(); // Fecha inicio del día
    const fechaLimaDateFin = fechaLima.endOf('day').toDate(); // Fecha final del día
    const Sala = "2";

    this.ventasService.getVentasTelecom(fechaLimaDateInicio, fechaLimaDateFin, Sala).subscribe({
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

        if (JSON.stringify(this.ventas2) !== JSON.stringify(ventasMapeadas)) {
          this.previousVentas2 = [...this.ventas2];
          this.ventas2 = ventasMapeadas;
          console.log('Datos actualizados:', ventasMapeadas);
        }
      },
      error: (err) => {
        console.error('Error al obtener ventas:', err);
      }
    });
  }
  obtenerVentasSala4() {
    const fechaLima = moment.tz('America/Lima').startOf('day');
    const fechaLimaDateInicio = fechaLima.toDate(); // Fecha inicio del día
    const fechaLimaDateFin = fechaLima.endOf('day').toDate(); // Fecha final del día
    const Sala = "4";

    this.ventasService.getVentasTelecom(fechaLimaDateInicio, fechaLimaDateFin, Sala).subscribe({
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

        if (JSON.stringify(this.ventas4) !== JSON.stringify(ventasMapeadas)) {
          this.previousVentas4 = [...this.ventas4];
          this.ventas4 = ventasMapeadas;
          console.log('Datos actualizados:', ventasMapeadas);
        }
      },
      error: (err) => {
        console.error('Error al obtener ventas:', err);
      }
    });
  }
  obtenerVentasIntaladas() {
      const fechainiciomes = moment.tz('America/Lima').startOf('month').toDate();
      const fechadehoy = moment.tz('America/Lima').toDate();
  
      this.ventasService.getVentasInstaladasTelecomp(fechainiciomes, fechadehoy).subscribe({
        next: (data: any) => {
          const ventasMapeadas = data.datos.map((item: any) => ({
            vintaladas: parseInt(item.vintaladas)
          }));
          ventasMapeadas.sort((a: any, b: any) => {
            return b.vintaladas - a.vintaladas;
          });
          if (JSON.stringify(this.instaladas) !== JSON.stringify(ventasMapeadas)) {
            this.instaladas = ventasMapeadas;
          }
        },
        error: (err) => {
          console.error('Error al obtener ventas:', err);
        }
      });
    }
get ventasTotales(): number {
  return this.ventas2.reduce((sum, v) => sum + v.number_sales, 0);
}
get ventasInstaladas(): number {
  return this.instaladas.reduce((sum, v) => sum + v.vintaladas, 0);
}
get ventasFaltantes(): number {
  return 1050 -(this.instaladas.reduce((sum, v) => sum + v.vintaladas, 0));
}
isNewRowVentas2(index: number): boolean {
  if (!this.previousVentas2 || this.previousVentas2.length === 0) return false;
  if (index >= this.previousVentas2.length) return true;

  const current2= this.ventas2[index];
  const previous2 = this.previousVentas2[index];

  return JSON.stringify(current2) !== JSON.stringify(previous2);
}

isNewRowVentas4(index: number): boolean {
  if (!this.previousVentas4 || this.previousVentas4.length === 0) return false;
  if (index >= this.previousVentas4.length) return true;

  const current4 = this.ventas4[index];
  const previous4 = this.previousVentas4[index];

  return JSON.stringify(current4) !== JSON.stringify(previous4);
}
}
