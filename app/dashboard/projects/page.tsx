import { Metadata } from 'next';
import ProjectsPage from '@/components/projects/projects-page';

export const metadata: Metadata = {
  title: 'Projects - ArcusHR',
  description: 'Manage projects and task assignments',
};

export default function Projects() {
  return <ProjectsPage />;
}