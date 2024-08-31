/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

/** Counter for generating unique IDs for producers and consumers. */
let nextId = 0;

/** The currently active reactive consumer, or `null` if none. */
let activeConsumer: ReactiveNode | null = null;

/** Whether change notifications are currently being propagated. */
let notifying = false;

/** Sets the current reactive consumer and returns the previous one. */
export function setActiveConsumer(consumer: ReactiveNode | null): ReactiveNode | null {
  const previous = activeConsumer;
  activeConsumer = consumer;
  return previous;
}

/** Represents a dependency between a producer and a consumer. */
type Dependency = {
  /** Reference to the producer node. */
  readonly producerRef: WeakRef<ReactiveNode>;
  /** Reference to the consumer node. */
  readonly consumerRef: WeakRef<ReactiveNode>;
  /** Version of the consumer when this dependency was last observed. */
  consumerVersion: number;
  /** Version of the producer's value when this dependency was last accessed. */
  producerVersion: number;
};

/** Represents a node in the reactive graph. Nodes can act as producers, consumers, or both. */
export abstract class ReactiveNode {
  private readonly id = nextId++;

  /** Weak reference to this node, used in dependencies. */
  private readonly ref = new WeakRef(this);

  /** Dependencies of this node as a producer. */
  private readonly producers = new Map<number, Dependency>();

  /** Dependencies of this node as a consumer. */
  private readonly consumers = new Map<number, Dependency>();

  /** Version of the consumer's dependencies. */
  protected trackingVersion = 0;

  /** Version of the producer's value. */
  protected valueVersion = 0;

  /** Called when a dependency may have changed. */
  protected onDependencyChange(): void {}

  /** Called when a consumer checks if the producer's value has changed. */
  protected onProducerMayChanged(): void {}

  /** Checks if any of this node's dependencies have actually changed. */
  protected hasDependenciesChanged(): boolean {
    for (const [producerId, dependency] of this.producers) {
      const producer = dependency.producerRef.deref();

      if (producer === undefined || dependency.consumerVersion !== this.trackingVersion) {
        // Dependency is stale; remove it.
        this.producers.delete(producerId);
        producer?.consumers.delete(this.id);
        continue;
      }

      if (producer.checkValueChanged(dependency.producerVersion)) {
        return true;
      }
    }

    return false;
  }

  /** Notifies consumers that this producer's value may have changed. */
  protected notifyConsumers(): void {
    const wasNotifying = notifying;
    notifying = true;
    try {
      for (const [consumerId, dependency] of this.consumers) {
        const consumer = dependency.consumerRef.deref();
        if (consumer === undefined || consumer.trackingVersion !== dependency.consumerVersion) {
          this.consumers.delete(consumerId);
          consumer?.producers.delete(this.id);
          continue;
        }

        consumer.onDependencyChange();
      }
    } finally {
      notifying = wasNotifying;
    }
  }

  /** Records that this producer node was accessed in the current context. */
  protected recordAccess(): void {
    if (notifying) {
      throw new Error('Cannot read signals during notification phase.');
    }

    if (activeConsumer === null) {
      return;
    }

    let dependency = activeConsumer.producers.get(this.id);
    if (dependency === undefined) {
      dependency = {
        consumerRef: activeConsumer.ref,
        producerRef: this.ref,
        producerVersion: this.valueVersion,
        consumerVersion: activeConsumer.trackingVersion,
      };
      activeConsumer.producers.set(this.id, dependency);
      this.consumers.set(activeConsumer.id, dependency);
    } else {
      dependency.producerVersion = this.valueVersion;
      dependency.consumerVersion = activeConsumer.trackingVersion;
    }
  }

  /** Whether this consumer has any producers. */
  protected get hasProducers(): boolean {
    return this.producers.size > 0;
  }

  /** Checks if the producer's value has changed compared to the last recorded version. */
  private checkValueChanged(lastSeenVersion: number): boolean {
    if (this.valueVersion !== lastSeenVersion) {
      return true;
    }

    this.onProducerMayChanged();
    return this.valueVersion !== lastSeenVersion;
  }
}
