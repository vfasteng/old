import { BallConstraintWrapper } from "./BallConstraintWrapper";
import { PathConstraintWrapper } from "./PathConstraintWrapper";
import { BallConstraintFactory, PathConstraintFactory } from "../../ConstraintFactory";

export function deserializeConstraintWrapper(data, physicsWorld) {

    let factory = getFactory(data, physicsWorld);

    factory.deserialize(data);

}

export function serializeConstraintWrapper(wrapper, physicsWorld) {

    let factory = getFactory(wrapper, physicsWorld);

    return factory.serialize(wrapper);

}

function getFactory(typedObj, physicsWorld) {

    let factory;

    switch(typedObj.$type) {

        case("BallConstraint"):
            factory = new BallConstraintFactory(physicsWorld)
        break;
        
        case("PathConstraint"):
            factory = new PathConstraintFactory(physicsWorld);
        break;
        default:
            logErr("Unknown constraint type");
        break;

    }

    return factory;

}