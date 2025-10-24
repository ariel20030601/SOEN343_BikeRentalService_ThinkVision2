package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.DockManagementService;
import com.thinkvision.backend.applicationLayer.ToggleDockRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operator")
@CrossOrigin(origins = "*")
public class OperatorController {

    private DockManagementService dockManagementService;

    @PostMapping("/toggleDockStatus")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<String> toggleDockStatus(@RequestBody ToggleDockRequest req) {
        String op = req.operatorId() == null ? "unknown" : req.operatorId();
        String msg = dockManagementService.toggleOutOfService(req.dockId(), req.outOfService(), op);
        return ResponseEntity.ok(msg);
    }
}
