"""
BVH Spatial Acceleration Index for Tissue Handles (v12)
"""
from models.types import AABB, TissueHandle

class BVHNode:
    def __init__(self, bounds: AABB, tissue_handle: TissueHandle | None = None):
        self.bounds = bounds
        self.tissue_handle = tissue_handle
        self.left: 'BVHNode | None' = None
        self.right: 'BVHNode | None' = None

class BVHSpatialIndex:
    def __init__(self):
        self.root: BVHNode | None = None

    def build(self, items: list[tuple[TissueHandle, AABB]]):
        if not items:
            self.root = None
            return

        nodes = [BVHNode(bounds=aabb, tissue_handle=h) for h, aabb in items]
        self.root = self._build_recursive(nodes)

    def _build_recursive(self, nodes: list[BVHNode]) -> BVHNode:
        if len(nodes) == 1:
            return nodes[0]

        # Combine bounds
        min_x = min(n.bounds.min_point[0] for n in nodes)
        min_y = min(n.bounds.min_point[1] for n in nodes)
        min_z = min(n.bounds.min_point[2] for n in nodes)

        max_x = max(n.bounds.max_point[0] for n in nodes)
        max_y = max(n.bounds.max_point[1] for n in nodes)
        max_z = max(n.bounds.max_point[2] for n in nodes)

        parent_bounds = AABB((min_x, min_y, min_z), (max_x, max_y, max_z))
        parent = BVHNode(bounds=parent_bounds)

        mid = len(nodes) // 2
        parent.left = self._build_recursive(nodes[:mid])
        parent.right = self._build_recursive(nodes[mid:])
        return parent

    def query_box(self, query_aabb: AABB) -> list[TissueHandle]:
        results = []
        if not self.root:
            return results

        stack = [self.root]
        while stack:
            curr = stack.pop()
            if curr.bounds.intersects(query_aabb):
                if curr.tissue_handle is not None:
                    results.append(curr.tissue_handle)
                if curr.left:
                    stack.append(curr.left)
                if curr.right:
                    stack.append(curr.right)

        return results
