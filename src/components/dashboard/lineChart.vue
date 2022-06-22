<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  data() {
    return {
      datacollection: {
        labels: ["January", "February", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Customer",
            data: [10, 19, 3, 5, 2, 3],
            borderColor: ["#5271ff"],
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true,
              },
            },
          ],
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true,
              },
            },
          ],
        },
        legend: {
          display: true,
        },
        elements: {
          point: {
            radius: 0,
          },
        },
      },
    };
  },
  mounted() {
    this.renderChart(this.datacollection, this.options);
  },
};
</script>
