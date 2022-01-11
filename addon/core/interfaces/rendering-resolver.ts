import GlimmerComponent from '@glimmer/component';
import { ColumnDefinition } from './column';

// Args can be useful to:
// Pass extra information display in a header
// Customize a cell's state (custom empty state for example)
export type ResolvedRenderingComponent = {
  component: GlimmerComponent;
  args?: { [key: string]: any };
};

export interface RendererResolver {
  lookupHeaderComponent(definition: ColumnDefinition): Promise<ResolvedRenderingComponent>;
  //lookupFilteringComponent(definition: ColumnDefinition): Promise<ResolvedRenderingComponent>;
  //lookupCellComponent(definition: ColumnDefinition): Promise<ResolvedRenderingComponent>;
}
