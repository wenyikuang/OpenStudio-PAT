import { Projects } from './projects';

export interface DatapointState {
  name: string;
  isChecked?: boolean;
}

export const EXPECTED_DATAPOINTS_BY_PROJECT: Record<Projects, DatapointState[]> = {
  [Projects.OFFICE_HVAC]: [
    {
      name: 'Baseline',
      isChecked: false
    },
    {
      name: 'Fan Coil DOAS',
      isChecked: false
    },
    {
      name: 'VAV DX',
      isChecked: false
    },
    {
      name: 'Radiant DOAS',
      isChecked: false
    },
    {
      name: 'VAV Chilled Water',
      isChecked: false
    }
  ],
  [Projects.OFFICE_STUDY]: [...Array(80).keys()].map(num => ({
    name: `DOE Autogenerated ${num + 1}`
  })),
  [Projects.NEW]: []
};
