import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-orbital',
  templateUrl: './orbital.component.html',
  styleUrls: ['./orbital.component.css']
})
export class OrbitalComponent {
  id:string='';
  title = 'orbital';
  constructor(
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

}

